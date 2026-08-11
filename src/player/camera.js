import * as THREE from 'three';

const BACK = 6.0;     // 플레이어 뒤로 떨어진 거리
const HEIGHT = 2.35;  // 카메라 높이
const LOOK_AT = 1.55; // 바라보는 높이 (플레이어 어깨 근처)
const SIDE = 0.85;    // 오버더숄더 횡 오프셋 — 플레이어를 화면 중앙에서 왼쪽으로 밀어낸다
const POS_LAG = 6.0;  // 위치 추종 속도
const ROT_LAG = 3.2;  // 회전 추종 속도 — 위치보다 느려야 부드럽다

/**
 * 3인칭 백뷰 추적 카메라.
 *
 * 회전 추종을 위치보다 느리게 둔다. 방향을 틀면 카메라가 한 박자 늦게 따라와서
 * 플레이어가 화면 중앙에서 살짝 벗어나는데, 이미지 1·2의 구도가 그 상태다.
 */
export function createFollowCamera({ camera }) {
  let smoothed = null;
  const target = new THREE.Vector3();
  const desired = new THREE.Vector3();

  return {
    update(dt, pos, heading) {
      if (smoothed === null) smoothed = heading;

      // 각도를 -π..π 최단 경로로 보간한다
      let diff = heading - smoothed;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      smoothed += diff * Math.min(1, ROT_LAG * dt);

      // heading 0에서 전진 벡터는 (0,-1). 오른쪽 벡터는 전진을 Y축 기준 -90도
      // 돌린 (cos h, -sin h) — heading과 함께 회전하므로 플레이어가 돌아도
      // 화면 속 위치(왼쪽으로 치우침)가 그대로 유지된다.
      //
      // 카메라 위치와 바라보는 지점을 같은 만큼 옆으로 평행 이동시킨다. lookAt은
      // target을 항상 화면 정중앙에 두므로, target 자체를 안 옮기고 카메라만
      // 옮기면 플레이어는 계속 중앙에 남는다 — 대상(플레이어)은 그대로 두고
      // "보는 지점"을 오른쪽으로 밀어야 플레이어가 화면 왼쪽으로 밀려난다.
      const rightX = Math.cos(smoothed);
      const rightZ = -Math.sin(smoothed);

      desired.set(
        pos.x + Math.sin(smoothed) * BACK + rightX * SIDE,
        HEIGHT,
        pos.z + Math.cos(smoothed) * BACK + rightZ * SIDE
      );
      camera.position.lerp(desired, Math.min(1, POS_LAG * dt));

      target.set(pos.x + rightX * SIDE, LOOK_AT, pos.z + rightZ * SIDE);
      camera.lookAt(target);
    }
  };
}
